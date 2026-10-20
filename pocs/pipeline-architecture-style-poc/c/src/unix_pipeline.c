#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    int pipe1[2]; // Pipe between Producer and Tester
    int pipe2[2]; // Pipe between Tester and Transformer/Consumer

    if (pipe(pipe1) == -1 || pipe(pipe2) == -1) {
        perror("Failed to create POSIX pipe");
        exit(EXIT_FAILURE);
    }

    printf("=================================================================\n");
    printf("Starting Unix C Pipeline (pipe -> fork -> dup2)\n");
    printf("=================================================================\n\n");

    // 1. PRODUCER FILTER PROCESS
    pid_t pid1 = fork();
    if (pid1 == -1) {
        perror("Fork producer failed");
        exit(EXIT_FAILURE);
    }

    if (pid1 == 0) {
        // Child 1: Producer
        close(pipe1[0]); // Close unused read end of pipe 1
        dup2(pipe1[1], STDOUT_FILENO); // stdout -> pipe1 write end
        close(pipe1[1]);

        close(pipe2[0]);
        close(pipe2[1]);

        // Emits raw transaction values (some positive, some negative/invalid)
        printf("1200\n");
        printf("-50\n");
        printf("850\n");
        printf("0\n");
        printf("420\n");
        fflush(stdout);
        exit(0);
    }

    // 2. TESTER FILTER PROCESS
    pid_t pid2 = fork();
    if (pid2 == -1) {
        perror("Fork tester failed");
        exit(EXIT_FAILURE);
    }

    if (pid2 == 0) {
        // Child 2: Tester (Filters criteria: amount > 0)
        close(pipe1[1]); // Close write end of pipe 1
        dup2(pipe1[0], STDIN_FILENO); // stdin <- pipe1 read end
        close(pipe1[0]);

        close(pipe2[0]); // Close read end of pipe 2
        dup2(pipe2[1], STDOUT_FILENO); // stdout -> pipe2 write end
        close(pipe2[1]);

        int amount;
        while (scanf("%d", &amount) == 1) {
            // Tester evaluation: Only forward strictly positive amounts
            if (amount > 0) {
                printf("%d\n", amount);
                fflush(stdout);
            }
        }
        exit(0);
    }

    // Parent closes pipe1 ends so EOF is propagated properly
    close(pipe1[0]);
    close(pipe1[1]);

    // 3. TRANSFORMER & CONSUMER FILTER PROCESS
    pid_t pid3 = fork();
    if (pid3 == -1) {
        perror("Fork transformer failed");
        exit(EXIT_FAILURE);
    }

    if (pid3 == 0) {
        // Child 3: Transformer & Consumer Sink
        close(pipe2[1]); // Close write end of pipe 2
        dup2(pipe2[0], STDIN_FILENO); // stdin <- pipe2 read end
        close(pipe2[0]);

        int amount;
        double totalGross = 0.0;
        double totalTax = 0.0;
        int count = 0;

        printf("--- Transformed Records Output (Pipe 2 Consumer Sink) ---\n");
        while (scanf("%d", &amount) == 1) {
            double tax = (double)amount * 0.15;
            double net = (double)amount - tax;
            totalGross += (double)amount;
            totalTax += tax;
            count++;

            printf("  [Item %d] Gross: $%d | Tax (15%%): $%.2f | Net: $%.2f\n", count, amount, tax, net);
        }

        printf("---------------------------------------------------------\n");
        printf("C Pipeline Summary Report:\n");
        printf("  Valid Count: %d\n", count);
        printf("  Total Gross: $%.2f\n", totalGross);
        printf("  Total Tax:   $%.2f\n", totalTax);
        printf("=========================================================\n\n");
        exit(0);
    }

    // Parent closes pipe2 ends
    close(pipe2[0]);
    close(pipe2[1]);

    // Wait for all three filter child processes to finish
    waitpid(pid1, NULL, 0);
    waitpid(pid2, NULL, 0);
    waitpid(pid3, NULL, 0);

    return 0;
}
