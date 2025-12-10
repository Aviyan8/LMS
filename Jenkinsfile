// pipeline {
//     agent any
//     stages {
//         stage('Build') {
//             steps {
//                 echo 'Building...'
//             }
//         }
//         stage('Test') {
//             steps {
//                 echo 'Testing...'
//             }
//         }
//         stage('Deploy') {
//             steps {
//                 echo 'Deploying to AWS EC2...'
//                 sshagent(['ec2-key']) {
//                     sh '''
//                     ssh -o StrictHostKeyChecking=no ubuntu@3.80.101.187 << 'EOF'
//                     cd /var/www/lms/lms-backend-singleton-master
//                     git pull origin main
//                     npm install
//                     pm2 restart lms-backend || pm2 start src/server.js --name lms-backend
//                     EOF
//                     '''
//         }
//     }
// }

//             }
//         }
//     }
// }

pipeline {
    agent any

    environment {
        NODE_ENV = "production"
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/Aviyan8/LMS.git', branch: 'main'
            }
        }

        stage('Build') {
            steps {
                echo 'Building...'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
            }
        }

        // stage('Deploy') {
            // steps {
            //     echo 'Deploying...'
            //     sshagent(['ec2-key']) {
            //         sh '''
            //         ssh -o StrictHostKeyChecking=no ubuntu@3.80.101.187 << 'EOF'
            //         cd /var/www/lms/lms-backend-singleton-master
            //         git pull origin main
            //         npm install
            //         pm2 restart lms-backend || pm2 start src/server.js --name lms-backend
            //         EOF
            //         '''
                    stage('Deploy') {
                        steps {
                            echo 'Deploying...'
                            sh '''
                            ssh -i /var/lib/jenkins/keys/Jenkins.pem -o StrictHostKeyChecking=no ubuntu@3.80.101.187 << 'EOF'
                            cd /var/www/lms/lms-backend-singleton-master
                            git pull origin main
                            npm install
                            pm2 restart lms-backend || pm2 start server.js --name lms-backend
                            EOF
                            '''
                    
                }
            }
        }
    }
}
