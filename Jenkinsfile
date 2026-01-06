pipeline {
    agent any

    environment {
        MAP_PATH = "/home/huy/nginx/conf.d/active_backend.map"
    }

    stages {

        stage('Determine Target') {
            steps {
                script {
                    def active = sh(script: "cat ${MAP_PATH}", returnStdout: true).trim()
                    if (active.contains("laravel-blue")) {
                        env.TARGET = "green"
                        env.OLD = "blue"
                    } else {
                        env.TARGET = "blue"
                        env.OLD = "green"
                    }
                }
            }
        }

        stage('Docker Build & Up') {
            steps {
                sh "docker-compose up -d --build ${env.TARGET}"
            }
        }

        stage('Switch Traffic') {
            steps {
                script {

                    sh "echo 'server laravel-${env.TARGET}:80;' > ${MAP_PATH}"

                    sh "docker exec nginx nginx -s reload"
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo "Optional: Stopping old container ${env.OLD}"

            }
        }
    }
}
