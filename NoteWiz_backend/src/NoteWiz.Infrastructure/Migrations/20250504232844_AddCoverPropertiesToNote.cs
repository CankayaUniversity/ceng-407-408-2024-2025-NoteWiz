using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteWiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverPropertiesToNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverColor",
                table: "Notes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CoverPosition",
                table: "Notes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CoverType",
                table: "Notes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "NoteDrawings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverColor",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "CoverPosition",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "CoverType",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "NoteDrawings");
        }
    }
}
