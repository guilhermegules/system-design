CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = unix_pipeline
SRC = src/unix_pipeline.c

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC)

clean:
	rm -f $(TARGET)

.PHONY: all clean
