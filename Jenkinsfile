pipeline {
    agent any

    environment {
        MAP_PATH = "/home/huy/nginx/conf.d/active_backend.map"
    }

    stages {

        stage('Determine Target with Python') {
            steps {
                script {

                    def output = sh(script: "python3 deploy-zero-downtime.py", returnStdout: true).trim()

                    output.split("\n").each { line ->
                        def parts = line.split("=")
                        if (parts.length == 2) {
                            env."${parts[0]}" = parts[1]
                        }
                    }

                    echo "Python xác định Target là: ${env.TARGET}"
                }
            }
        }
    }
}
