pipeline {
  agent any
  stages {
    stage('Test GitHub Token') {
      steps {
        git url: 'https://github.com/huynguyentuan03k/podcast-app.git',
            credentialsId: 'github-token'
      }
    }
  }
}
