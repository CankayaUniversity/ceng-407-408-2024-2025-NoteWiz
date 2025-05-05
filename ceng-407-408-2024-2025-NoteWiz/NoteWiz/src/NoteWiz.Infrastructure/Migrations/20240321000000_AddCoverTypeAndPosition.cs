using Microsoft.EntityFrameworkCore.Migrations;

namespace NoteWiz.Infrastructure.Migrations
{
    public partial class AddCoverTypeAndPosition : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoverType",
                table: "Notes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CoverPosition",
                table: "Notes",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverType",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "CoverPosition",
                table: "Notes");
        }
    }
} 