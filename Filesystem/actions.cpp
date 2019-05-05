#include "nsfuse.h"

static void synchronizedEntry()
{
#if SYNCHRONIZED_ENTRY == 1
	struct fuse_context* fctx = fuse_get_context();
	struct FuseThreadContext* context = (struct FuseThreadContext*)fctx->private_data;
	context->mutex.lock();
#endif
}

static void synchronizedExit()
{
#if SYNCHRONIZED_ENTRY == 1
	struct fuse_context* fctx = fuse_get_context();
	struct FuseThreadContext* context = (struct FuseThreadContext*)fctx->private_data;
	context->mutex.unlock();
#endif
}

int doReadDir(const char* path, void* buffer, filler_func_t filler,
	FUSE_OFF_T offset, struct fuse_file_info* fi)
{
	synchronizedEntry();

	ptrInt* args = cbArgsMaxSize(1);
	args[DC_Path] = (ptrInt)path;

	printf("\nActivating DirectoryContent\n");
	printf("Path: %s\n", path);

	ptrInt* res = cbActivate(DirectoryContent);
	if(res == NULL) {
		printf("Returned failure.\n");
		synchronizedExit();
		return 0;
	}

	printf("Returned success.\n");

	ptrInt i;
	ptrInt numEntries = res[DC_Count];
	char** entries = (char**)malloc(sizeof(char*) * numEntries);

	// Entries need to be copied, because filler function enters into
	// callbacks, overwriting the res structure.
	for(i = 0; i < res[DC_Count]; i++) {
		char* entryName = (char*)res[(i * DC_EntrySize) + DC_FirstEntryName];
		entries[i] = entryName;
	}

	// Finished using result buffer, safe to unlock.
	synchronizedExit();

	for(i = 0; i < numEntries; i++) {
		printf("Entry: %s\n", entries[i]);
		filler(buffer, entries[i], NULL, 0);
	}

	printf("Leaving callback.\n");
	return 0;
}

int doGetAttr(const char* path, struct FUSE_STAT* st)
{
	synchronizedEntry();

	ptrInt* args = cbArgsMaxSize(1);
	args[FA_Path] = (ptrInt)path;

	printf("\nActivating FileAttributes\n");
	printf("Path: %s\n", path);

	ptrInt* res = cbActivate(FileAttributes);
	if(res == NULL) {
		printf("Returned failure.\n");
		synchronizedExit();
		return 0;
	}

	printf("Returned success.\n");

	if(!res[FA_Exists]) {
		printf("File doesn't exist. Return\n");
		synchronizedExit();
		return -1;
	}

#if defined BUILD_LINUX
	st->st_uid = getuid();
	st->st_gid = getgid();
	st->st_atime = res[FA_AccessedTime];
	st->st_mtime = res[FA_ModifiedTime];
#elif defined BUILD_WIN
	printf("Assigning Atim: %u\n", res[FA_AccessedTime]);
	st->st_atim.tv_sec = res[FA_AccessedTime];
	printf("Assinging Mtim: %u\n", res[FA_ModifiedTime]);
	st->st_mtim.tv_sec = res[FA_ModifiedTime];
#endif

	printf("Assinging Mode: %u\n", res[FA_Mode]);
	printf("Assigning Type: %u\n", res[FA_Type]);
	st->st_mode = res[FA_Type] | res[FA_Mode];

	printf("Assigning NumLinks: %u\n", res[FA_NumLinks]);
	st->st_nlink = res[FA_NumLinks];

	printf("Assinging Size: %u\n", res[FA_Size]);
	st->st_size = res[FA_Size];

	printf("Leaving callback.\n");
	synchronizedExit();
	return 0;
}

int doOpen(const char *path, struct fuse_file_info *fi)
{
	synchronizedEntry();

	ptrInt* args = cbArgsMaxSize(2);
	args[FO_Path] = (ptrInt)path;
	args[FO_Flags] = (ptrInt)fi->flags;

	printf("\nActivating FileOpen\n");
	printf("Path: %s\n", path);

	ptrInt* res = cbActivate(FileOpen);
	if(res == NULL) {
		printf("Returned failure.\n");
		synchronizedExit();
		return -1;
	}

	printf("Returned success.\n");
	fi->fh = res[FO_Handle];
	int success = res[FO_Success];

	printf("Leaving callback.\n");
	synchronizedExit();
	return success;
}

int doRead(const char* path, char* buffer, size_t size, FUSE_OFF_T offset,
struct fuse_file_info* fi)
{
	synchronizedEntry();

	ptrInt* args = cbArgsMaxSize(4);
	args[FR_Path] = (ptrInt)path;
	args[FR_Buffer] = (ptrInt)buffer;
	args[FR_Size] = size;
	args[FR_Offset] = (ptrInt)offset; // WARNING: Offset is 64-bit !!

	printf("\nActivating FileRead\n");
	printf("Path: %s\n", path);

	ptrInt* res = cbActivate(FileRead);
	if(res == NULL) {
		printf("Returned failure.\n");
		synchronizedExit();
		return 0;
	}

	printf("Returned success.\n");
	uint32_t bytesRead = res[FR_BytesRead];
	printf("Bytes read: %u", bytesRead);

	printf("Leaving callback.\n");
	synchronizedExit();
	return bytesRead;
}
