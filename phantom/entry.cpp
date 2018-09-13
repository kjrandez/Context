#include "nsfuse.h"

static ptrInt semaSignalStub(ptrInt index);
static void* threadMain(FuseThreadContext* context);

static FuseThreadContext* latestContext = NULL;

uint32_t registered()
{
	// API is registered when a FUSE thread has been started, but has not
	// either exited gracefully or been forcefully unregistered.

	return latestContext != NULL;
}

uint32_t registerAndMount(uint32_t semaIndex, ptrInt semaSignal)
{
	// Force user to acknowledge previous FUSE thread choked by requiring
	// unregister to be called if mount fails.
	if(registered())
		return false;

	latestContext = new FuseThreadContext();

	latestContext->semaIndex = semaIndex;
	latestContext->semaSignal = (ptrInt(*)(ptrInt))semaSignal;
	latestContext->mountPoint = "X:";

	//if(!threadCreateMutex(&latestContext->setupLock))
	//	return false;
	//if(!threadCreateSignal(&latestContext->setupSignal))
	//	return false;
	//latestContext->setupFailed = false;

	//threadLockMutex(&latestContext->setupLock);

	// Thread will be started. On Linux, blocks until we call threadWait.
	std::thread thread(threadMain, latestContext);
	thread.detach();
	/*if(!threadStart((ptrInt*)&latestContext->thread, threadMain, latestContext)) {
		threadUnlockMutex(&latestContext->setupLock);
		return false;
	}*/

	//threadWait(&latestContext->setupSignal, &latestContext->setupLock);

	/*if(latestContext->setupFailed) {
		struct FuseThreadContext* deadContext = latestContext;
		unregister();
		free(deadContext);
		threadUnlockMutex(&latestContext->setupLock);
		return false;
	}

	threadUnlockMutex(&latestContext->setupLock);*/
	return true;
}

void unregister() {
	if(latestContext != NULL) {
		// Prevent previous thread from calling signalSemaphoreWithIndex.
		latestContext->semaSignal = semaSignalStub;
		latestContext = NULL;
	}
}

struct FuseThreadContext* registeredContext()
{
	return latestContext;
}

static ptrInt semaSignalStub(ptrInt index) { return 0; }

static void* threadMain(FuseThreadContext* context)
{
	//threadLockMutex(&context->setupLock);

	//if(!threadCreateMutex(&context->lock)) {
	//	context->setupFailed = true;
		//threadSignal(&context->setupSignal);
		//threadUnlockMutex(&context->setupLock);
	//	return NULL;
	//}

	//if(!threadCreateSignal(&context->signal)) {
	//	context->setupFailed = true;
		//threadSignal(&context->setupSignal);
		//threadUnlockMutex(&context->setupLock);
	//	return NULL;
	//}

	//if(!fsMount(context)) {
	//	context->setupFailed = true;
		//threadSignal(&context->setupSignal);
		//threadUnlockMutex(&context->setupLock);
	//	return NULL;
	//}

	//context->setupFailed = !fsMounted();
	//threadSignal(&context->setupSignal);

	//threadUnlockMutex(&context->setupLock);

	fsRun(context);

	//ptrInt* mutex = &context->setupLock;
	//threadLockMutex(mutex);

	if(context == latestContext) {
		ptrInt(*finalSemaSignal)(ptrInt) = context->semaSignal;
		uint32_t finalSemaIndex = context->semaIndex;
		unregister();
		finalSemaSignal(finalSemaIndex);
	}
	free(context);

	//threadUnlockMutex(mutex);
	return NULL;
}