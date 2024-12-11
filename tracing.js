const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { trace } = require("@opentelemetry/api");

// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

module.exports = (serviceName) => {
    console.log("Initializing tracing for service:", serviceName);

    // Configure Jaeger Exporter
    const exporter = new JaegerExporter({
        endpoint: "http://localhost:14268/api/traces", // Jaeger HTTP endpoint
    });
    console.log("Jaeger Exporter configured with endpoint:", "http://localhost:14268/api/traces");

    // Configure Tracer Provider
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });
    console.log("Tracer Provider initialized with service name:", serviceName);

    // Add Span Processor
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    console.log("Simple Span Processor added to Tracer Provider");

    // Register the Tracer Provider
    provider.register();
    console.log("Tracer Provider registered successfully");

    // Register Instrumentations
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });
    console.log("Instrumentations registered: HTTP, Express, MongoDB");

    // Return the Tracer
    console.log("Tracing setup complete. Returning tracer instance.");
    return trace.getTracer(serviceName);
};
