import path from "path";
import { createLogger, Logger, transports } from "winston";
import axios, { AxiosResponse } from "axios";
import { Commander } from "../lib/commander/Commander";

class SpeedTest {
  private static readonly binaryName = "speedtest";
  private static readonly unitFlag = "-u";
  private static readonly unitFormat = "Mbps";
  private static readonly outputFormatFlag = "-f";
  private static readonly outputFormat = "json-pretty";

  private static readonly storeUrl =
    "https://internet-speed-isakhauge.herokuapp.com/api/speedtest";

  private logger: Logger;

  public constructor() {
    this.logger = SpeedTest.createLogger();
  }

  private static createLogger(): Logger {
    return createLogger({
      transports: [
        new transports.File({
          filename: path.resolve(__dirname, "../../logs/results.log"),
          level: "debug",
        }),
        new transports.File({
          filename: path.resolve(__dirname, "../../logs/errors.log"),
          level: "error",
        }),
      ],
    });
  }

  public async run(): Promise<SpeedTestResult> {
    try {
      const arg = SpeedTest.composeArgument();
      const rawStr: string = await Commander.exec(arg);
      const result = JSON.parse(rawStr) as SpeedTestResult;

      this.storeSpeedTestResultDeferred(result);

      this.logger.info({
        type: "info",
        timestamp: new Date().toISOString(),
        message: "Speedtest was successfully logged",
      });

      return result;
    } catch (e) {
      this.logger.error({
        type: "error",
        timestamp: new Date().toISOString(),
        message: "An error occured while running the speedtest command",
        reason: e.message ?? undefined,
      });
      throw new Error();
    }
  }

  private static composeArgument(): string {
    return [
      SpeedTest.binaryName,
      SpeedTest.unitFlag,
      SpeedTest.unitFormat,
      SpeedTest.outputFormatFlag,
      SpeedTest.outputFormat,
    ].join(" ");
  }

  private storeSpeedTestResultDeferred(data: SpeedTestResult) {
    axios
      .post(SpeedTest.storeUrl, data)
      .then((response: AxiosResponse) => {
        const logMessage = `${response.status}: ${response.data?.message}`;
        this.logger.info(logMessage);
      })
      .catch((reason: any) => {
        this.logger.error(reason);
      });
  }
}

export default SpeedTest;

type SpeedTestResult = {
  timestamp: string;
  ping: {
    jitter: number;
    latency: number;
  };
  download: {
    bandwidth: number;
    bytes: number;
    elapsed: number;
  };
  upload: {
    bandwidth: number;
    bytes: number;
    elapsed: number;
  };
  packetLoss: number;
  isp: string;
  interface: {
    internalIp: string;
    name: string;
    macAddr: string;
    isVpn: boolean;
    externalIp: string;
  };
  server: {
    id: number;
    name: string;
    location: string;
    country: string;
    host: string;
    port: number;
    ip: string;
  };
  result: {
    id: string;
    url: string;
  };
};
