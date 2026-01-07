pipeline {
    agent any

    environment {
        MAP_PATH = "/etc/nginx/conf.d/active_backend.map"
    }

    stages {
        stage('Determine Target with Python') {
            steps {
                script {

                    def result = sh(script: "python3 deploy-zero-downtime.py", returnStdout: true).trim()

                    echo "--- Output from Python Script ---"
                    echo result
                    echo "---------------------------------"
                    result.split("\n").each { line ->
                        if (line.contains("=")) {
                            def parts = line.split("=")

                            env."${parts[0].trim()}" = parts[1].trim()
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

        stage('build docker and up docker'){
            steps{
                sh "docker-compose up -d --build ${env.TARGET}"
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "--- Đang kiểm tra sức khỏe bản mới: ${env.TARGET} ---"

                    def containerName = "laravel-${env.TARGET}"

                    def status = sh(
                        script: """
                            count=0
                            while [ \$count -lt 10 ]; do
                                # Kiểm tra xem container có phản hồi HTTP 200 không
                                # Thay 'http://localhost/' bằng endpoint thực tế của bạn nếu cần (vd: /api/health)
                                if docker exec ${containerName} curl -s -f http://localhost/ > /dev/null; then
                                    echo "--- [OK] Bản mới đã sẵn sàng! ---"
                                    exit 0
                                fi
                                echo "App chưa sẵn sàng, đang thử lại lần \$((count+1))..."
                                sleep 3
                                count=\$((count+1))
                            done
                            exit 1
                        """,
                        returnStatus: true
                    )

                    if (status != 0) {

                        error "--- [LỖI] Bản mới ${env.TARGET} không khởi động được. Giữ nguyên bản cũ để bảo vệ hệ thống! ---"
                    }
                }
            }
        }

        stage('Switch Traffic and Cleanup') {
            steps {
                script {
                    echo "--- Đang chuyển Traffic sang ${env.TARGET} ---"


                    sh "echo 'default laravel-${env.TARGET};' > ${env.MAP_PATH}"

                    sh "docker exec nginx nginx -s reload"

                    echo "--- [THÀNH CÔNG] Đã chuyển traffic sang bản mới! ---"


                    echo "--- Đang tắt bản cũ: ${env.OLD} ---"
                    sh "docker stop laravel-${env.OLD} || true"
                }
            }
        }

    }
        post {
            failure {
                echo "Pipeline thất bại. Vui lòng kiểm tra lại log của container ${env.TARGET}."
            }
        }
}
