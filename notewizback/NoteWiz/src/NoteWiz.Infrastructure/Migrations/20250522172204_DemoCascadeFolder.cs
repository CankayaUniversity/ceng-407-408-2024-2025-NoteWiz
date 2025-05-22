using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteWiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DemoCascadeFolder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FolderNotes_Notes_NoteId",
                table: "FolderNotes");

            migrationBuilder.AddForeignKey(
                name: "FK_FolderNotes_Notes_NoteId",
                table: "FolderNotes",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FolderNotes_Notes_NoteId",
                table: "FolderNotes");

            migrationBuilder.AddForeignKey(
                name: "FK_FolderNotes_Notes_NoteId",
                table: "FolderNotes",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id");
        }
    }
}
