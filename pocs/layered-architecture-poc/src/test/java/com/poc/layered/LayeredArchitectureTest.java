package com.poc.layered;

import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "com.poc.layered", importOptions = ImportOption.DoNotIncludeTests.class)
class LayeredArchitectureTest {

  @ArchTest
  static final ArchRule enforcesTopDownLayering = layeredArchitecture()
      .consideringOnlyDependenciesInLayers()
      .layer("Controller").definedBy("..controller..")
      .layer("Service").definedBy("..service..")
      .layer("Repository").definedBy("..repository..")
      .layer("Entity").definedBy("..entity..")
      .layer("Dto").definedBy("..dto..")
      .layer("Exception").definedBy("..exception..")
      .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
      .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller")
      .whereLayer("Repository").mayOnlyBeAccessedByLayers("Service")
      .whereLayer("Entity").mayOnlyBeAccessedByLayers("Service", "Repository", "Dto")
      .whereLayer("Dto").mayOnlyBeAccessedByLayers("Controller", "Service")
      .whereLayer("Exception").mayOnlyBeAccessedByLayers("Controller", "Service")
      .because("layered architecture only allows top-down dependencies");
}
