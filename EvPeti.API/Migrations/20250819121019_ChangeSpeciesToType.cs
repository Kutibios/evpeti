using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvPeti.API.Migrations
{
    /// <inheritdoc />
    public partial class ChangeSpeciesToType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Species",
                table: "Pets",
                newName: "Type");

            migrationBuilder.AlterColumn<decimal>(
                name: "Rating",
                table: "Reviews",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(3,2)");

            // Index'ler zaten mevcut, oluşturulmayacak
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Index'ler zaten mevcut, kaldırılmayacak

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Pets",
                newName: "Species");

            migrationBuilder.AlterColumn<decimal>(
                name: "Rating",
                table: "Reviews",
                type: "decimal(3,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }
    }
}
