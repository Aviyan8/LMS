pipeline {
    agent any

    environment {
        NODE_ENV = "production"
    }

    stages {
        stage('Checkout') {
            steps {
                // Pull code from GitHub
                git url: 'https://github.com/Aviyan8/LMS.git', branch: 'main'
            }
        }

        stage('Build') {
            steps {
                echo 'Building...'
                // Optional: Add actual build commands here, e.g., npm install
                sh 'echo "Build step completed"'
            }
        }

        stage('Test') {
            steps {
                echo 'Testing...'
                // Optional: Run tests here, e.g., npm test
                sh 'echo "Test step completed"'
            }
        }

        stage('Deploy') {
               steps {
                    echo "Deploying using Docker..."
            
                    sh """
                    ssh -o StrictHostKeyChecking=no -i \C:\Users\aviya\Downloads\Jenkins.pem"\jenkins.pem ubuntu@54.221.187.211  << 'EOF'
            
                        cd ~/lms-deploy
            
                        # Pull latest code from GitHub
                        if [ ! -d ".git" ]; then
                            git clone https://github.com/Aviyan8/LMS.git .
                        else
                            git pull origin main
                        fi
            
                        # Build Docker image
                        docker-compose down
                        docker-compose build
                        docker-compose up -d
            
                    EOF
                    """
                
            }
        }
    }
}
