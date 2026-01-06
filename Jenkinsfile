pipeline {
    agent any

    environment {
        MAP_PATH = "/etc/nginx/conf.d/active_backend.map"
    }

    stages {
        stage('Determine Target with Python') {
            steps {
                script {
                    // Chạy python và in kết quả ra log web
                    def result = sh(script: "python3 deploy-zero-downtime.py", returnStdout: true).trim()

                    echo "--- Output from Python Script ---"
                    echo result
                    echo "---------------------------------"

                    result.split("\n").each { line ->
                        if (line.contains("=")) {
                            def parts = line.split("=")
                            env."${parts[0]}" = parts[1]
                        }
                    }
                }
            }
        }

        stage('Display Result') {
            steps {
                echo "Mục tiêu hiện tại là: ${env.TARGET}"
            }
        }
    }
}
