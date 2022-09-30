const compute_pi = require("compute-pi-rs-lib");

const {Metrics} = require("@aws-lambda-powertools/metrics");
const {Logger} = require("@aws-lambda-powertools/logger");
const {Tracer} = require("@aws-lambda-powertools/tracer");

const metrics = new Metrics();
const logger = new Logger();
const tracer = new Tracer();

exports.handler = async (event, context) => {
    // Tracer: Get facade segment created by AWS Lambda
    const segment = tracer.getSegment();

    // Tracer: Create subsegment for the function & set it as active
    const handlerSegment = segment.addNewSubsegment(`## ${process.env._HANDLER}`);
    tracer.setSegment(handlerSegment);

    // Tracer: Annotate the subsegment with the cold start & serviceName
    tracer.annotateColdStart();
    tracer.addServiceNameAnnotation();

    // Tracer: Add annotation for the awsRequestId
    tracer.putAnnotation("awsRequestId", context.awsRequestId);

    // Metrics: Capture cold start metrics
    metrics.captureColdStartMetric();

    // Logger: Add persistent attributes to each log statement
    logger.addPersistentLogAttributes({
        awsRequestId: context.awsRequestId,
    });

    logger.info("Executing generate function from the dynamic lib.");

    const invocationSegment = segment.addNewSubsegment(`### Native invocation`);
    tracer.setSegment(invocationSegment);
    const digits = await compute_pi.generate(event.digits);
    invocationSegment.close();

    const result =  {
        digits: event.digits,
        pi: digits.join("")
    };

    // Tracer: Close subsegment (the AWS Lambda one is closed automatically)
    handlerSegment.close(); // (## index.handler)

    // Tracer: Set the facade segment as active again (the one created by AWS Lambda)
    tracer.setSegment(segment);

    return result;
};

async function run(x, it) {
    console.log(`start ${x}`);
    const res = await compute_pi.generate(it);
    console.log(`end ${x}`);
    return res;
}
