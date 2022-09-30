locals {
  function_name = "compute-pi-js-with-rs-x86"
}

data "archive_file" "lambda_my_function" {
  type             = "zip"
  source_dir       = "${path.module}/../aws-lambda-compute-pi-js-with-rs"
  output_file_mode = "0666"
  output_path      = "${path.module}/compute-pi-js-with-rs-x86.zip"
}

resource "aws_lambda_function" "lambda" {
  filename      = data.archive_file.lambda_my_function.output_path
  function_name = local.function_name
  role          = aws_iam_role.lambda_role.arn
  handler       = "app.handler"

  source_code_hash = data.archive_file.lambda_my_function.output_sha

  runtime = "nodejs16.x"
  timeout = 300

  tracing_config {
    mode = "Active"
  }
}

data "aws_iam_policy_document" "trust_policy" {
  statement {
    sid    = ""
    effect = "Allow"

    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "${local.function_name}-role"
  assume_role_policy = data.aws_iam_policy_document.trust_policy.json
}

resource "aws_iam_role_policy_attachment" "basic_exec_role_attachmenet" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "xray_role_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}