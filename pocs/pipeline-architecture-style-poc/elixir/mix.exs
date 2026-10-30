defmodule PipelineDemo.MixProject do
  use Mix.Project

  def project do
    [
      app: :pipeline_demo,
      version: "1.0.0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      description: "Pipeline Architecture Style (Pipes & Filters) in Elixir",
      package: [
        maintainers: ["Guilherme Gules Moreira"],
        licenses: ["MIT"]
      ]
    ]
  end

  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    []
  end
end
