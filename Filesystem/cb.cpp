#include "nsfuse.h"

static ptrInt* awaitCallbackResult(struct FuseThreadContext* context,
		struct ActivatedCallback* _ac);
static struct FuseThreadContext* getContext();

static int requestCount;
static ptrInt* args;
static uint32_t argsSize;

void cbReset()
{
	if(args != NULL)
		free(args);

	requestCount = 0;
	args = NULL;
	argsSize = 0;
}

extern ptrInt fsThread;

static ptrInt entries = 0;
static ptrInt exits = 0;

ptrInt* cbActivate(uint32_t type)
{
	assert(exits == entries);
	entries++;

	struct FuseThreadContext* context = getContext();

	struct ActivatedCallback ac;
	ac.type = type;
	ac.tag = requestCount++;
	ac.args = args;

	ptrInt* result = awaitCallbackResult(context, &ac);

	exits++;
	return result;
}

ptrInt* cbArgsMaxSize(uint32_t maxSize)
{
	if(maxSize > argsSize)
		args = (ptrInt*)realloc(args, sizeof(ptrInt) * maxSize);

	return args;
}

uint32_t cbType()
{
	if(registered())
		return registeredContext()->ac->type;
	return -1;
}

ptrInt* cbArgs()
{
	if(registered())
		return registeredContext()->ac->args;
	return (ptrInt*)-1;
}

uint32_t cbTag()
{
	if(registered())
		return registeredContext()->ac->tag;
	return -1;
}

static ptrInt* awaitCallbackResult(struct FuseThreadContext* context, struct ActivatedCallback* _ac)
{
	//----- CALLED FROM THE FUSE THREAD -----//
	std::unique_lock<std::mutex> lock(context->acWaitMutex);

	printf("Awaiting tag %d\n", _ac->tag);

	context->acWaitComplete = false;
	context->ac = _ac;

	// Signal to NS that a callback has been activated.
	context->semaSignal(context->semaIndex);

	// Wait on Newspeak to answer.
	while(!context->acWaitComplete)
		context->acWaitCondition.wait(lock);

	printf("Result obtained.\n");
	return context->acResult;
}

void cbResult(uint32_t tag, ptrInt* result)
{
	//----- CALLED FROM THE VM THREAD -----//
	FuseThreadContext* context = registeredContext();

	std::lock_guard<std::mutex> lock(context->acWaitMutex);

	assert(tag == context->ac->tag);
	context->acResult = result;
	context->acWaitComplete = true;

	// Notify that a result is obtained for the callback.
	context->acWaitCondition.notify_one();
}

static FuseThreadContext* getContext()
{
	fuse_context* fctx = fuse_get_context();
	return (FuseThreadContext*)fctx->private_data;
}
