enum CallbackType
{
	DirectoryContent = 0,
	FileAttributes = 1,
	FileRead = 2,
	FileOpen = 3,
};

//---------------------------//
//---- DirectoryContents ----//
//---------------------------//

enum DirectoryContentArgs
{
	DC_Path = 0
};

#define DC_EntrySize 2

enum DirectoryContentResponse
{
	DC_Passthrough = 0, // Null or C-str with path to pass through
	DC_Count = 1,
	DC_FirstEntryName = 2,
	DC_FirstEntryType = 3,
// 	DC_SecondEntryName = 4,
//	DC_SecondEntryType = 5,
// 	...
};

//------------------------//
//---- FileAttributes ----//
//------------------------//

enum FileAttributesArgs
{
	FA_Path = 0
};

#define FA_UseProcessUID -1
#define FA_UseProcessGID -1

enum FileAttributesResponse
{
	FA_Passthrough = 0, // Null or C-str w/ path of file to pass through
	FA_OwnerUID = 1, // Real value or -1 (Use this process UID)
	FA_OwnerGID = 2, // Real value or -1 (Use this process GID)
	FA_AccessedTime = 3,
	FA_ModifiedTime = 4,
	FA_Type = 5, // Values same as stat->st_mode
	FA_Mode = 6, // Values same as stat->st_mode
	FA_NumLinks = 7,
	FA_Size = 8,
	FA_Exists = 9
};

//------------------//
//---- FileRead ----//
//------------------//

enum FileReadArgs
{
	FR_Path = 0,
	FR_Buffer = 1,
	FR_Size = 2,
	FR_Offset = 3,
};

enum FileReadResponse
{
	FR_Passthrough = 0, // Null or C-str w/ path of file to pass through
	FR_BytesRead = 1 // -1 Indicating can't read
};

//------------------//
//---- FileOpen ----//
//------------------//

enum FileOpenArgs
{
	FO_Path = 0,
	FO_Flags = 1
};

enum FileOpenResponse
{
	FO_Passthrough = 0, // Null or C-str w/ path of file to pass through
	FO_Handle = 1, // Optional
	FO_Success = 2
};






