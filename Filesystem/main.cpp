#include "nsfuse.h"

// Compile as executable to run test program without Newspeak

char* fileOneContent = "Hello world! How are you today?\r\n";
char* fileTwoContent = "Well I'm doing just fine thank you very much!\r\n";

static ptrInt fakeSemaSignal(ptrInt index);
static void handleCallback();
static void handleDirectoryContent();
static void handleFileAttributes();
static void handleFileRead();
static void handleFileOpen();

static ptrInt* res;
static uint32_t tag = 0;

static ptrInt fakeSemaSignal(ptrInt index)
{
	HANDLE sema = (HANDLE)index;
	ReleaseSemaphore(sema, 1, NULL);
	return 0;
}

void handleCallback()
{
	ptrInt eventType = cbType();

	switch(eventType) {
	case DirectoryContent:
		handleDirectoryContent();
		break;
	case FileAttributes:
		handleFileAttributes();
		break;
	case FileRead:
		handleFileRead();
		break;
	case FileOpen:
		handleFileOpen();
		break;
	default:
		printf("Unhandled callback\n");
	}
}

static char* mallocString(const char* str)
{
	int len = strlen(str);
	char* out = (char*)malloc(len + 1);
	out[len] = 0;
	memcpy(out, str, len);
	return out;
}

static void handleDirectoryContent()
{
	printf("Directory Content\n");

	ptrInt* args = cbArgs();
	char* filename = (char*)args[FA_Path];
	printf("Dir: %s\n", filename);

	if(strcmp(filename, "/") == 0) {
		res[DC_Count] = 2;
		res[DC_FirstEntryName] = (ptrInt)mallocString("file1.txt");
		res[DC_FirstEntryType] = 0;
		res[DC_FirstEntryName + 2] = (ptrInt)mallocString("file2.txt");
	}
	else {
		res[DC_Count] = 0;
	}
}

static void handleFileAttributes()
{
	printf("File Attributes\n");

	ptrInt* args = cbArgs();
	char* filename = (char*)args[FA_Path];
	printf("File: %s\n", filename);

	if(strcmp(filename, "/") == 0) {
		printf("It's directory.\n");
		// Directory
		res[FA_Type] = S_IFDIR;
		res[FA_Mode] = 0755;
		res[FA_NumLinks] = 1;
		res[FA_Exists] = 1;

		return;
	}
	else if(strcmp(filename, "/file1.txt") == 0 || strcmp(filename, "/file2.txt") == 0) {
		printf("It's file.\n");
		// File
		res[FA_Type] = S_IFREG;
		res[FA_Mode] = 0755;
		res[FA_NumLinks] = 1;

		if(strcmp(filename, "/file1.txt") == 0)
			res[FA_Size] = strlen(fileOneContent);
		else if(strcmp(filename, "/file2.txt") == 0)
			res[FA_Size] = strlen(fileTwoContent);
		else
			res[FA_Size] = 0;
		res[FA_Exists] = 1;

		return;
	}

	res[FA_Exists] = 0;
}

static void handleFileOpen()
{
	printf("File Open\n");

	ptrInt* args = cbArgs();
	char* filename = (char*)args[FO_Path];
	printf("File: %s\n", filename);

	res[FO_Handle] = 0;
	res[FO_Success] = 0;
}

static void handleFileRead()
{
	printf("File Read\n");

	ptrInt* args = cbArgs();
	char* filename = (char*)args[FR_Path];
	char* buffer = (char*)args[FR_Buffer];
	ptrInt size = args[FR_Size];
	ptrInt offset = args[FR_Offset];

	char* file = NULL;
	if(strcmp(filename, "/file1.txt") == 0)
		file = fileOneContent;
	else if(strcmp(filename, "/file2.txt") == 0)
		file = fileTwoContent;

	if(file == NULL) {
		res[FR_BytesRead] = 0;
		return;
	}

	ptrInt available = strlen(file) - offset;
	ptrInt readSize = size;
	if(readSize > available)
		readSize = available;

	memcpy(buffer, file + offset, readSize);

	res[FR_BytesRead] = readSize;
}

void doFilesystem()
{
	HANDLE sema = CreateSemaphore(NULL, 0, 10, NULL);
	registerAndMount((ptrInt)sema, (ptrInt)fakeSemaSignal);
	res = (ptrInt*)malloc(sizeof(ptrInt) * 1000);

	while(true) {
		DWORD result = WaitForSingleObject(sema, INFINITE);

		switch(result) {
		case 0: {
			ptrInt reqTag = cbTag();
			if(reqTag != tag) {
				printf("Bad tag: %d\n", reqTag);
				return;
			}
			handleCallback();
			cbResult(tag, res);
			tag++;
			break;
		}
		default:
			printf("Error occurred.\n");
			return;
		}
	}
}

int main(int argc, char** args)
{
	while(true) {
		doFilesystem();
	}

	return 0;
}