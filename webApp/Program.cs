using Microsoft.EntityFrameworkCore;
using webApp.Data;
using webApp.Services;

var builder = WebApplication.CreateBuilder(args);

//Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        //Handle circular reference (due to having removed JsonIgnore)
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

//Add Entity Framework
builder.Services.AddDbContext<BlogDbContext>(options =>
    options.UseSqlite("Data Source=blog.db"));

//Add Repository
builder.Services.AddScoped<IBlogRepository, BlogRepository>();

//Helpdesk services
builder.Services.AddScoped<IHelpdeskRepository, HelpdeskRepository>();

//Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

//Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//Initialize database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<BlogDbContext>();
    context.Database.EnsureCreated(); //Creates database if it doesn't exist
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => "Welcome to My Blog API! Visit /swagger for API documentation.");

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();