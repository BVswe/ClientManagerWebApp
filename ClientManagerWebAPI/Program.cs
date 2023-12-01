using ClientManagerWebAPI;
using ClientManagerWebAPI.Converters;
using ClientManagerWebAPI.Repositories.Interfaces;
using ClientManagerWebAPI.Repositories.Repositories;
using Dapper;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using System.Diagnostics;

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
SqlMapper.AddTypeHandler(new DapperSqlDateOnlyTypeHandler());

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.Configure<DBConnectionConfig>(builder.Configuration.GetSection("ConnectionStrings"));
builder.Services.AddSingleton<DBSetup>();
builder.Services.AddScoped<IClientRepo, ClientRepo>();
builder.Services.AddScoped<IClientTouchupRepo, ClientTouchupRepo>();
builder.Services.AddScoped<IClientPigmentRepo, ClientPigmentRepo>();
builder.Services.AddScoped<IClientMediaRepo, ClientMediaRepo>();
builder.Services.AddSwaggerGen(options =>
    options.MapType<DateOnly>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "date",
        Example = new OpenApiString("yyyy-MM-dd")
    })
);
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<AddUnboundParametersOperationFilter>();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseDefaultFiles();
app.UseStaticFiles();


app.UseHttpsRedirection();

//app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.UseAuthorization();

app.MapControllers();

//Debug.WriteLine("Connection String" + builder.Configuration.GetConnectionString("DBSetup"));

var dbs = app.Services.GetService<DBSetup>();
await dbs!.Init();

app.Run();
