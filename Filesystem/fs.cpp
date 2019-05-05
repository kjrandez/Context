#include "nsfuse.h"
#include <dokan/dokan.h>
#include <sys/types.h>
#include <time.h>

#if defined BUILD_LINUX

static struct fuse* inst = NULL;

int fsMount(struct FuseThreadContext* context)
{
	char* argv[2];
	argv[0] = "";
	argv[1] = "X:";

	struct fuse_args args = {
		.argc = 2,
		.argv = argv,
		.allocated = 0
	};

	struct fuse_operations ops = {
		.getattr = doGetAttr,
		.readdir = doReadDir,
		.read = doRead
	};

	inst = fuse_new(&args, &ops, sizeof(struct fuse_operations), context);
	if(inst == NULL)
		return 0;

	if(fuse_mount(inst, context->mountPoint) != 0) {
		inst = NULL;
		return 0;
	}

	return 1;
}

int fsMounted() {
	return inst != NULL;
}

int fsRun(struct FuseThreadContext* context)
{
	cbReset();

	fuse_loop(inst);

	inst = NULL;
	return 0;
}

#elif defined BUILD_WIN

int fsMount(struct FuseThreadContext* context)
{
	return 1;
}

int fsMounted() {
	return true;
}

ptrInt fsThread;

int fsRun(struct FuseThreadContext* context)
{
	int argc = 4;
	char* argv[4];
	argv[0] = "";
	argv[1] = "-f";
#if SYNCHRONIZED_ENTRY != 1
	argv[2] = "-s";
#else
	argv[2] = "-f";
#endif
	argv[3] = "X:";

	struct fuse_operations ops = {};// = new fuse_operations;
	ops.getattr = doGetAttr;
	ops.readdir = doReadDir;
	ops.open = doOpen;
	ops.read = doRead;

	cbReset();

	// See: https://github.com/dokan-dev/dokany/blob/master/dokan_fuse/src/dokanfuse.cpp
	fuse_main(argc, argv, &ops, context);

	return 0;
}

void fsUnmount(char* mountPoint)
{
	WCHAR driveLetter = 'X';
	DokanUnmount(driveLetter);
}

#endif
