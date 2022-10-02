# aws-lambda-compute-pi-js-with-rs

## Build the dylib

```
cd compute-pi-rs-lib
npm run win-build-x86  # win-build-arm64
npm pack
```

## Build the Lambda

```
cd aws-lambda-compute-pi-js-with-rs
npm install
```

## Deploy the Lambda

```
cd infrastructure
terraform int # if this is first time
terraform apply --auto-approve
```