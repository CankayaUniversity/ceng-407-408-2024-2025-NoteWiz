using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoteWiz.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfflineFieldsToNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeviceId",
                table: "Notes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOffline",
                table: "Notes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Notes",
                type: "datetime2",
                nullable: true,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<string>(
                name: "SyncStatus",
                table: "Notes",
                type: "nvarchar(max)",
                nullable: true,
                defaultValue: "synced");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeviceId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "IsOffline",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "SyncStatus",
                table: "Notes");
        }
    }
}
