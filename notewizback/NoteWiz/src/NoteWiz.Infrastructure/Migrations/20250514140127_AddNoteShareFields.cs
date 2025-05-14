using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteWiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNoteShareFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "SharedWithUserId",
                table: "NoteShares",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "NoteShares",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "NoteShares",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ShareLink",
                table: "NoteShares",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ShareMethod",
                table: "NoteShares",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ShareToken",
                table: "NoteShares",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SharedWithEmail",
                table: "NoteShares",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "NoteShares");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "NoteShares");

            migrationBuilder.DropColumn(
                name: "ShareLink",
                table: "NoteShares");

            migrationBuilder.DropColumn(
                name: "ShareMethod",
                table: "NoteShares");

            migrationBuilder.DropColumn(
                name: "ShareToken",
                table: "NoteShares");

            migrationBuilder.DropColumn(
                name: "SharedWithEmail",
                table: "NoteShares");

            migrationBuilder.AlterColumn<int>(
                name: "SharedWithUserId",
                table: "NoteShares",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
