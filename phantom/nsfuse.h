#ifndef NSFUSE_H_
#define NSFUSE_H_

#define SYNCHRONIZED_ENTRY 1
#define IGNORE_PRINTF 1
#define FUSE_USE_VERSION 27

#include <cstdio>
#include <cstdlib>
#include <cstdbool>
#include <cstdint>
#include <cstring>

#include <inttypes.h>
#include <assert.h>
#include <fuse/fuse.h>

#include <thread>
#include <mutex>
#include <condition_variable>

#if defined BUILD_LINUX
#include <unistd.h>
#elif defined BUILD_WIN
#include <Windows.h>
#endif

#if defined BUILD_LINUX
#define SIZEOF_POINTER 8
#elif defined BUILD_WIN
#define SIZEOF_POINTER 4
#endif

#if SIZEOF_POINTER == 4
	typedef uint32_t ptrInt;
#elif SIZEOF_POINTER == 8
	typedef uint64_t ptrInt;
#else
#error pointer not 4 or 8 bytes?
#endif

#if defined BUILD_LINUX
#define fuse_stat stat
#define fuse_off_t off_t
#endif

#if IGNORE_PRINTF == 1
#define printf(fmt, ...) (0)
#endif

struct ActivatedCallback
{
	uint32_t type;
	ptrInt* args;
	uint32_t tag;
};

struct FuseThreadContext
{
	ptrInt (*semaSignal)(ptrInt);
	uint32_t semaIndex;
	char* mountPoint;

	std::mutex mutex;

	struct ActivatedCallback* ac;
	std::mutex acWaitMutex;
	std::condition_variable acWaitCondition;
	bool acWaitComplete;
	ptrInt* acResult;
};

extern FILE* out;

#include "struc.h"

// ------------------------------
//  api.c
// ------------------------------

extern "C"
{
	__declspec(dllexport) uint32_t registerAndMount(uint32_t semaIndex, ptrInt semaSignal);
	__declspec(dllexport) uint32_t registered();
	__declspec(dllexport) void unregister();
}
struct FuseThreadContext* registeredContext();

// ------------------------------
//  fs.c
// ------------------------------

int fsMount(struct FuseThreadContext* context);
int fsRun(struct FuseThreadContext* context);
int fsMounted();
extern "C" __declspec(dllexport) void fsUnmount(char* mountPoint);

// ------------------------------
//  cb.c
// ------------------------------

void cbReset();
ptrInt* cbActivate(uint32_t type);
ptrInt* cbArgsMaxSize(uint32_t maxSize);

extern "C" {
	__declspec(dllexport) void cbResult(uint32_t tag, ptrInt* result);
	__declspec(dllexport) uint32_t cbType();
	__declspec(dllexport) ptrInt* cbArgs();
	__declspec(dllexport) uint32_t cbTag();
}

// ------------------------------
//  actions.c
// ------------------------------

extern "C"
{
	typedef int(*filler_func_t) (void *buf, const char *name, const struct FUSE_STAT *stbuf, FUSE_OFF_T off);

	int doReadDir(const char* path, void* buffer, filler_func_t filler, FUSE_OFF_T offset, struct fuse_file_info* fi);
	int doGetAttr(const char* path, struct FUSE_STAT* st);
	int doOpen(const char *path, struct fuse_file_info *fi);
	int doRead(const char* path, char* buffer, size_t size, FUSE_OFF_T offset, struct fuse_file_info* fi);
}

#endif
