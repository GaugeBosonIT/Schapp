use master
go
drop database schapp_db
go
create database schapp_db
go
use schapp_db
go



CREATE LOGIN schapp_user 
    WITH PASSWORD = 'Ocihnabad';
USE schapp_db;
CREATE USER schapp_user FOR LOGIN schapp_user;
GO 


CREATE FUNCTION [dbo].[fn_base64_digits]()
RETURNS VARCHAR(64)
AS
BEGIN

RETURN '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
END

GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


	
CREATE FUNCTION [dbo].[fn_base64_string_to_int](@str64 VARCHAR(6))
RETURNS INT
AS
BEGIN
DECLARE @int1 INT, @digit INT, @Characters VARCHAR(64), @pass INT, @len INT

SELECT 
	@Characters = dbo.fn_base64_digits()
	,@pass = LEN(@str64)
	,@int1 = 0

WHILE @pass > 0
BEGIN

SELECT @int1 = @int1 + ((CHARINDEX(SUBSTRING(REVERSE(@str64),@pass,1),@Characters COLLATE Latin1_General_CS_AS)-1)*POWER(64,@pass-1)), @pass = @pass-1

END

RETURN @int1

END

GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


	
CREATE FUNCTION [dbo].[fn_int_to_base64_string](@int1 INT)
RETURNS VARCHAR(6)
AS
BEGIN
DECLARE @str64 VARCHAR(6), @digit INT, @Characters VARCHAR(64)

SELECT 
	@Characters = dbo.fn_base64_digits()
	,@str64 = ''

IF @int1 = 0
SET @str64 = '0'
ELSE
BEGIN
WHILE @int1 > 0
BEGIN

SELECT @digit = @int1 % 64, @str64 = SUBSTRING(@Characters,@digit+1,1) + @str64, @int1 = (@int1 - @digit)/64

END
END


RETURN @str64

END

GO





create table list
(
id int identity primary key not null,
name nvarchar(255) not null,
link as ([dbo].[fn_int_to_base64_string](id))
)
go
create table item
(
id int identity primary key not null,
list_id int foreign key references list(id) not null,
price int,
name nvarchar (255) not null,
shop nvarchar (255) not null
)

go
alter proc set_slist
@p XML,
@r XML OUTPUT
as
begin try 
declare @name nvarchar(255),
		@link nvarchar(255),
		@result XML,
		@new_link nvarchar(255),
		@list XML
		
	
	SELECT 
	@name = @p.value('(SList/@name)[1]', 'nvarchar(255)'),
	@link = @p.value('(SList/@link)[1]', 'nvarchar(255)')

		MERGE dbo.list AS target
		USING (
				SELECT DISTINCT 
				@name, 
				@link 
				) 
				AS source (
							s_name,
							s_link
							)
		ON (
			target.link = s_link
			)
		WHEN MATCHED THEN 
			UPDATE 
			SET 
			name = s_name
		WHEN NOT MATCHED THEN    
			INSERT (
					name
					)
			VALUES (
					s_name
					); 
		SET @new_link = [dbo].[fn_int_to_base64_string](SCOPE_IDENTITY())
		
		
		select @list = (
						select ISNULL(@new_link,@link) as "@link",
								@name as "@name"
								for xml path ('SList')
						)
		
	
	SELECT @r = (
					SELECT 0 as status, 
					object_name(@@PROCID) as proc_name 
					FOR XML RAW ('RESULT')
				)
				
	SET @r.modify('
		insert sql:variable("@list")
		into (RESULT)[1]
		')			
select @r		
end try
begin catch

select error_message()
end catch
go
ALTER proc [dbo].[get_slist]
@p XML,
@r XML OUTPUT
AS
begin try 
declare @link NVARCHAR(255),
		@l XML
select @link = @p.value('(SList/@link)[1]', 'nvarchar(255)')
 
 select @l = (
				select 	
						name as "@name",
						@link as "@link"
						from dbo.list
						where link  = @link
						for xml path ('SList')
				)
		SELECT @r = (
					SELECT 0 as status, 
					object_name(@@PROCID) as proc_name 
					FOR XML RAW ('RESULT')
					)
		SET @r.modify('
		insert sql:variable("@l")
		into (RESULT)[1]
		')

select @r
end try 
begin catch

	SELECT @r = (
					SELECT -1 as status, 
					object_name(@@PROCID) as proc_name 
					FOR XML RAW ('RESULT')
					)
end catch
go

grant exec on set_slist to schapp_user;

grant exec on get_slist to schapp_user;
insert list (name)
select 'somelist init'

select* from list

exec set_slist ''<SList name="ohyeah"/>''