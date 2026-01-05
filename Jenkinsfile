pipeline {
    agent any
    environment {
        IMAGE_NAME = "api-podcast-prod"
        NGINX_CONF_PATH = "/home/huy/nginx/conf.d/active_backend.conf"
    }
    stages {
        stage('Build Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }
        stage('Deploy & Switch') {
            steps {
                script {
                    def active = sh(script: "cat ${NGINX_CONF_PATH}", returnStdout: true).trim()
                    def target, targetPort, containerName

                    if (active.contains("laravel-blue")) {
                        target = "laravel-green"
                        targetPort = "8001"
                        containerName = "laravel-green"
                    } else {
                        target = "laravel-blue"
                        targetPort = "8000"
                        containerName = "laravel-blue"
                    }

                    echo "Deploying to ${target}..."

                    sh "docker stop ${containerName} || true"
                    sh "docker rm ${containerName} || true"
                    sh """
                        docker run -d --name ${containerName} \
                        --network jenkins_default \
                        -v /home/huy/podcast-app/.env:/var/www/html/.env \
                        -v /home/huy/podcast-app/storage:/var/www/html/storage \
                        ${IMAGE_NAME}:latest
                    """

                    echo "Waiting for container to be healthy..."
                    sleep 10

                    sh "echo 'server ${containerName}:80;' > ${NGINX_CONF_PATH}"

                    sh "docker exec nginx nginx -s reload"

                    echo "Successfully switched to ${target}. Zero downtime achieved!"
                }
            }
        }
        stage('Cleanup') {
            steps {
                sh "docker image prune -f"
            }
        }
    }
}
