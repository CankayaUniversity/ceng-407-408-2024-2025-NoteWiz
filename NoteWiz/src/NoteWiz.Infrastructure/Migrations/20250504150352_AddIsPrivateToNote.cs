using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteWiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPrivateToNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "AuthTokens");

            migrationBuilder.RenameColumn(
                name: "LastUsedAt",
                table: "AuthTokens",
                newName: "ExpiresAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Notifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CoverImageUrl",
                table: "Notes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "IsPrivate",
                table: "Notes",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Friendships",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRevoked",
                table: "AuthTokens",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "AuthTokens",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "IsPrivate",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Friendships");

            migrationBuilder.DropColumn(
                name: "IsRevoked",
                table: "AuthTokens");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "AuthTokens");

            migrationBuilder.RenameColumn(
                name: "ExpiresAt",
                table: "AuthTokens",
                newName: "LastUsedAt");

            migrationBuilder.AlterColumn<string>(
                name: "CoverImageUrl",
                table: "Notes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "AuthTokens",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
