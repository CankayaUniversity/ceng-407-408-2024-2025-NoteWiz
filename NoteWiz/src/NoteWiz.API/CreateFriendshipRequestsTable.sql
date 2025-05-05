CREATE TABLE [FriendshipRequests] (
    [Id] int NOT NULL IDENTITY,
    [SenderId] int NOT NULL,
    [ReceiverId] int NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_FriendshipRequests] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FriendshipRequests_Users_SenderId] FOREIGN KEY ([SenderId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_FriendshipRequests_Users_ReceiverId] FOREIGN KEY ([ReceiverId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_FriendshipRequests_SenderId] ON [FriendshipRequests] ([SenderId]);
CREATE INDEX [IX_FriendshipRequests_ReceiverId] ON [FriendshipRequests] ([ReceiverId]); 