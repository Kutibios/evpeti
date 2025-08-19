using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvPeti.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExperienceServicesImageUrlsIsActiveToListing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Experience",
                table: "Listings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrls",
                table: "Listings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Listings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Services",
                table: "Listings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Experience",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Services",
                table: "Listings");
        }
    }
}
