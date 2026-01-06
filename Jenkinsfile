pipeline {
    agent any

    environment {
        MAP_PATH = "/home/huy/nginx/conf.d/active_backend.map"
    }

    stage('Determine Target with Python') {
        steps {
            script {

                def result = sh(script: "python3 deploy-zero-downtime.py", returnStdout: true).trim()


                echo "--- Full Python Output ---"
                echo result
                echo "--------------------------"


                result.split("\n").each { line ->
                    if (line.contains("=")) {
                        def parts = line.split("=")
                        if (parts.length == 2) {
                            env."${parts[0]}" = parts[1]
                        }
                    }
                }
            }
        }
    }
}
