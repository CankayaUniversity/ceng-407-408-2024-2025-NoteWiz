-- DocumentId1 foreign key constraint adını bulmak için aşağıdaki sorguyu çalıştırabilirsiniz:
-- SELECT name FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('Notes') AND name LIKE '%DocumentId1%';

-- Eğer constraint adı FK_Notes_Documents_DocumentId1 ise:
ALTER TABLE Notes DROP CONSTRAINT FK_Notes_Documents_DocumentId1;
ALTER TABLE Notes DROP COLUMN DocumentId1; 