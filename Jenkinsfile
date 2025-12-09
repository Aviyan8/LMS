pipeline {
    agent any

    environment {
        EC2_HOST = 'your-ec2-public-ip'  // Replace with your EC2 IP
        APP_PORT = '3000'
        APP_DIR = '/home/ec2-user/app'
        SSH_CREDENTIALS = 'ec2-ssh-key'  // Jenkins credential ID
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Aviyan8/LMS.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'  // If your app has a build step
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: [SSH_CREDENTIALS]) {
                    // Copy files to EC2
                    sh """
                        rsync -avz -e "ssh -o StrictHostKeyChecking=no" \
                        --exclude 'node_modules' \
                        --exclude '.git' \
                        ./ ec2-user@${EC2_HOST}:${APP_DIR}/
                    """
                    
                    // SSH and restart app
                    sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} "
                            cd ${APP_DIR}
                            npm install --production
                            pm2 start ecosystem.config.js
                            pm2 save
                            sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
                        "
                    """
                }
            }
            
            post {
                success {
                    echo 'Deployment completed successfully!'
                }
                failure {
                    echo 'Deployment failed!'
                }
            }
        }
    }
}
