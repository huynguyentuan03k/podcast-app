pipeline {
    agent any

    environment {
        MAP_PATH = "/etc/nginx/conf.d/active_backend.map"

    }

    stages {

        // LƯU Ý ĐÂY LÀ CÚ PHÁP CỦA NGÔN NGỮ GROOVY

        stage('check user in jenkins'){
            steps{
                sh '''
                whoami
                id
                pwd
                '''
            }
        }

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

        stage('Load file .env of jenkins') {
            steps {
                // lưu ý là file là kind secret-file khi tạo file secret
                withCredentials([file(credentialsId: 'file-env-podcast', variable: 'ENV_FILE')]) {
                    sh '''
                    echo "ENV file path: $ENV_FILE"
                    cp "$ENV_FILE" .env
                    echo "== .env content =="
                    cat .env
                    '''
                }
            }
        }

        stage('Display Result') {
            steps {
                echo "Mục tiêu hiện tại là: ${env.TARGET}"
            }
        }

        stage('build docker and up docker , no cache'){
            steps{
                sh "docker compose build --no-cache ${env.TARGET}"
                sh "docker compose up -d ${env.TARGET}"
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

                    sh "docker exec nginx nginx -t"
                    sh "docker exec nginx nginx -s reload"

                    echo "--- [THÀNH CÔNG] Đã chuyển traffic sang ${env.TARGET}! ---"

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
