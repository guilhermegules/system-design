defmodule PipelineDemo do
  def produce_raw_transactions do
    [
      %{id: "TX-E01", user_id: "usr-1", amount: 1500.0, currency: :USD, channel: :web},
      %{id: "TX-E02", user_id: "usr-2", amount: -45.0, currency: :USD, channel: :pos},
      %{id: "TX-E03", user_id: "usr-3", amount: 850.0, currency: :EUR, channel: :mobile},
      %{id: "TX-E04", user_id: "usr-4", amount: 450000.0, currency: :GBP, channel: :wire},
      %{id: "TX-E05", user_id: "usr-5", amount: 320.0, currency: :GBP, channel: :web}
    ]
  end

  def test_compliance(transactions) do
    Enum.filter(transactions, fn tx ->
      is_valid = tx.amount > 0.0 and tx.amount <= 100_000.0
      unless is_valid do
        IO.puts("  [Tester] Filtered out invalid transaction: #{tx.id} (#{tx.amount} #{tx.currency})")
      end
      is_valid
    end)
  end

  def transform_currency_and_tax(transactions) do
    Enum.map(transactions, fn tx ->
      rate =
        case tx.currency do
          :EUR -> 1.08
          :GBP -> 1.29
          _ -> 1.0
        end

      amount_usd = tx.amount * rate
      tax_usd = amount_usd * 0.15
      net_usd = amount_usd - tax_usd

      %{
        id: tx.id,
        user_id: tx.user_id,
        original_amount: tx.amount,
        currency: tx.currency,
        amount_usd: amount_usd,
        tax_usd: tax_usd,
        net_usd: net_usd
      }
    end)
  end

  def map_reduce_analytics(transactions) do
    transactions
    |> Enum.group_by(& &1.currency)
    |> Enum.map(fn {currency, tx_list} ->
      count = length(tx_list)
      total_usd = Enum.reduce(tx_list, 0.0, &(&1.amount_usd + &2))
      avg_usd = total_usd / count
      {currency, %{count: count, total_usd: total_usd, avg_usd: avg_usd}}
    end)
    |> Map.new()
  end

  def consume_report({transactions, aggregates}) do
    total_gross = Enum.reduce(transactions, 0.0, &(&1.amount_usd + &2))
    total_tax = Enum.reduce(transactions, 0.0, &(&1.tax_usd + &2))

    IO.puts("\n================== ELIXIR PIPELINE AUDIT REPORT ==================")
    IO.puts("Total Processed Transactions: #{length(transactions)}")
    IO.puts("Gross Volume (USD):           $#{:erlang.float_to_binary(total_gross, decimals: 2)}")
    IO.puts("Total Tax Retained (USD):      $#{:erlang.float_to_binary(total_tax, decimals: 2)}")
    IO.puts("------------------------------------------------------------------")
    IO.puts("MapReduce Grouping by Currency:")

    Enum.each(aggregates, fn {currency, stats} ->
      formatted_total = :erlang.float_to_binary(stats.total_usd, decimals: 2)
      formatted_avg = :erlang.float_to_binary(stats.avg_usd, decimals: 2)
      IO.puts("  • [#{currency}] Count: #{stats.count} | Total: $#{formatted_total} USD | Avg: $#{formatted_avg} USD")
    end)

    IO.puts("==================================================================\n")
  end

  def run do
    IO.puts("Starting Elixir Pipeline (Pipes & Filters with |>)...")

    transactions =
      produce_raw_transactions()
      |> test_compliance()
      |> transform_currency_and_tax()

    aggregates = map_reduce_analytics(transactions)

    consume_report({transactions, aggregates})

    IO.puts("Elixir Pipeline finished successfully.")
  end
end
