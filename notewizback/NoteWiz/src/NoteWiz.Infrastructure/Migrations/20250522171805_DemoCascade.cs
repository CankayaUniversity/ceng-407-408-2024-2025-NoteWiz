using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteWiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DemoCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NoteDrawings_Notes_NoteId",
                table: "NoteDrawings");

            migrationBuilder.AddForeignKey(
                name: "FK_NoteDrawings_Notes_NoteId",
                table: "NoteDrawings",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NoteDrawings_Notes_NoteId",
                table: "NoteDrawings");

            migrationBuilder.AddForeignKey(
                name: "FK_NoteDrawings_Notes_NoteId",
                table: "NoteDrawings",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id");
        }
    }
}
