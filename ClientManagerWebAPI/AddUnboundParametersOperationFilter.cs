using ClientManagerWebAPI.Controllers;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ClientManagerWebAPI
{
    public class AddUnboundParametersOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var descriptor = context.ApiDescription.ActionDescriptor as ControllerActionDescriptor;

            if (descriptor != null && descriptor.ControllerTypeInfo == typeof(ClientMediaController) && descriptor.ActionName == nameof(ClientMediaController.Post))
            {
                var openApiMediaType = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Required = new HashSet<string> { "file" }, // make the parameter(s) required if needed
                        Properties = new Dictionary<string, OpenApiSchema>
                        {
                            { "ClientID" , new OpenApiSchema() { Type = "string", Format = "string" } },
                            { "MediaDate" , new OpenApiSchema() { Type = "string", Format = "string" } },
                            { "Before" , new OpenApiSchema() { Type = "string", Format = "string" } },
                            { "Avatar" , new OpenApiSchema() { Type = "string", Format = "string" } },
                            { "file" , new OpenApiSchema() { Type = "string", Format = "binary" } },
                        }
                    }
                };

                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                {
                    { "multipart/form-data", openApiMediaType }
                }
                };
            }
        }
    }
}
