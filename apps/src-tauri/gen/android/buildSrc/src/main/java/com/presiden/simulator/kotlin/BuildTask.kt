import java.io.File
import javax.inject.Inject
import org.apache.tools.ant.taskdefs.condition.Os
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.logging.LogLevel
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.Internal
import org.gradle.api.tasks.TaskAction
import org.gradle.process.ExecOperations

open class BuildTask @Inject constructor(
    private val execOperations: ExecOperations
) : DefaultTask() {

    @Internal
    var projectDir: File? = null

    @Input
    var rootDirRel: String? = null

    @Input
    var target: String? = null

    @Input
    var release: Boolean? = null

    @TaskAction
    fun assemble() {
        val baseExecutable = "npm"
        val candidates = if (Os.isFamily(Os.FAMILY_WINDOWS)) {
            listOf("$baseExecutable.cmd", "$baseExecutable.exe", "$baseExecutable.bat", baseExecutable)
        } else {
            listOf(baseExecutable)
        }

        var lastException: Exception? = null
        for (executable in candidates) {
            try {
                runTauriCli(executable)
                return
            } catch (e: Exception) {
                lastException = e
            }
        }
        if (lastException != null) {
            throw lastException
        }
    }

    fun runTauriCli(executable: String) {
        val projectDir = projectDir ?: throw GradleException("projectDir cannot be null")
        val rootDirRel = rootDirRel ?: throw GradleException("rootDirRel cannot be null")
        val target = target ?: throw GradleException("target cannot be null")
        val release = release ?: throw GradleException("release cannot be null")
        val cliArgs = mutableListOf("run", "--", "tauri", "android", "android-studio-script")

        if (logger.isEnabled(LogLevel.DEBUG)) {
            cliArgs.add("-vv")
        } else if (logger.isEnabled(LogLevel.INFO)) {
            cliArgs.add("-v")
        }
        if (release) {
            cliArgs.add("--release")
        }
        cliArgs.addAll(listOf("--target", target))

        execOperations.exec {
            workingDir(File(projectDir, rootDirRel))
            if (Os.isFamily(Os.FAMILY_WINDOWS)) {
                executable("cmd.exe")
                args(listOf("/c", executable) + cliArgs)
            } else {
                executable(executable)
                args(cliArgs)
            }
        }.assertNormalExitValue()
    }
}
