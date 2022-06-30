import com.github.gradle.node.yarn.task.YarnTask
import org.gradle.api.tasks.testing.logging.TestLogEvent

plugins {
    id("java")
    id("jacoco")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    id("com.github.node-gradle.node")
}

group = "org.snowjak"
version = "0.3.3"
description = "Simple tile-rotation game"

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
        modularity.inferModulePath.set(true)
    }
}

node {
    download.set(true)
    version.set("16.14.0")
    yarnVersion.set("1.22.17")
}

tasks {

    test {
        useJUnitPlatform()
        testLogging {
            events = setOf(TestLogEvent.PASSED, TestLogEvent.FAILED, TestLogEvent.SKIPPED)
        }
    }

    val copyTiles = task<Copy>("copyTiles") {
        from("src/main/resources/tiles")
        include("**/*.png", "**/*.json")
        duplicatesStrategy = DuplicatesStrategy.INCLUDE
        into("${project.projectDir}/src/main/frontend/public/assets/tiles")
    }

    val cleanTiles = task<Delete>("cleanTiles") {
        delete("${project.projectDir}/src/main/frontend/public/assets/tiles")
    }

    val install = create<YarnTask>("install-dependencies") {
        workingDir.set(file("${project.projectDir}/src/main/frontend"))
        args.set(listOf("install"))
    }

    val build = create<YarnTask>("build-frontend") {
        dependsOn(install)
        dependsOn(copyTiles)
        workingDir.set(file("${project.projectDir}/src/main/frontend"))
        args.set(listOf("build"))
    }

    val cleanup = create<Delete>("cleanup-frontend") {
        dependsOn(cleanTiles)
        delete("${project.projectDir}/src/main/frontend/build")
    }

    val copy = create<Copy>("copy-frontend") {
        dependsOn(build)
        from("${project.projectDir}/src/main/frontend/build")
        into("${rootDir}/build/resources/main/static/.")
    }

    compileJava {
        dependsOn(copy)
    }

    clean {
        dependsOn(cleanup)
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}