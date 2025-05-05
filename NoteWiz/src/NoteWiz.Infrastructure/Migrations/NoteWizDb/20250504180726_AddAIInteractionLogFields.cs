using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteWiz.Infrastructure.Migrations.NoteWizDb
{
    /// <inheritdoc />
    public partial class AddAIInteractionLogFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserInput",
                table: "AIInteractionLogs",
                newName: "ModelUsed");

            migrationBuilder.AddColumn<decimal>(
                name: "Cost",
                table: "AIInteractionLogs",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "InputPrompt",
                table: "AIInteractionLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "NoteId",
                table: "AIInteractionLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProcessingTime",
                table: "AIInteractionLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TokensUsed",
                table: "AIInteractionLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AIInteractionLogs_NoteId",
                table: "AIInteractionLogs",
                column: "NoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_AIInteractionLogs_Notes_NoteId",
                table: "AIInteractionLogs",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AIInteractionLogs_Notes_NoteId",
                table: "AIInteractionLogs");

            migrationBuilder.DropIndex(
                name: "IX_AIInteractionLogs_NoteId",
                table: "AIInteractionLogs");

            migrationBuilder.DropColumn(
                name: "Cost",
                table: "AIInteractionLogs");

            migrationBuilder.DropColumn(
                name: "InputPrompt",
                table: "AIInteractionLogs");

            migrationBuilder.DropColumn(
                name: "NoteId",
                table: "AIInteractionLogs");

            migrationBuilder.DropColumn(
                name: "ProcessingTime",
                table: "AIInteractionLogs");

            migrationBuilder.DropColumn(
                name: "TokensUsed",
                table: "AIInteractionLogs");

            migrationBuilder.RenameColumn(
                name: "ModelUsed",
                table: "AIInteractionLogs",
                newName: "UserInput");
        }
    }
}
