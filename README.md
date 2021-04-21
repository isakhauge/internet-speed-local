# Speedtest by Ookla® - NodeJS Logger
> This script will test your internet speed and send it to an API for storage.

## Dependency
You need Ookla®'s Speedtest CLI tool.

[Download and installation guide](https://www.speedtest.net/apps/cli)

## How to use
### Define environment file
Assuming you have pulled the repository, you now have to define the environment file.
```bash
# Make a copy of the example file
cp example.env .env
```

#### What you need to define
`STORE_URL`: The URL to the enpoint in which you can store the test result.<br>
`SPEEDTEST_CLI_UNIT_FORMAT`: The format in which you wish the bandwidth result to be.<br>
`SPEEDTEST_CLI_OUTPUT_FORMAT`: The format in which you wish the output to be.

#### Optional enviroment variables
If you set the `ENV` variable to `development`, the NodeJS app will console out relevant data for debugging purposes.

### Install packages 🧶
```bash
yarn install
```
### Build your NodeJS logger 🧶
```bash
yarn build
```
