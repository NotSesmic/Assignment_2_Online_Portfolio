pipeline {

    agent any

    environment {
        IMAGE_NAME = "portfolio-website"
        IMAGE_TAG  = "v1"
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                echo "Checking out source code from GitHub..."

                git branch: 'main',
                    url: 'https://github.com/NotSesmic/Assignment_2_Online_Portfolio.git'
            }
        }

        stage('Verify Tools') {
            steps {
                echo "Verifying Java..."
                sh 'java -version'

                echo "Verifying Maven..."
                sh 'mvn -version'

                echo "Verifying Docker..."
                sh 'docker --version'

                echo "Verifying Kubernetes..."
                sh 'kubectl version --client'
            }
        }

        stage('Clean Project') {
            steps {
                echo "Cleaning project..."
                dir('app') {
                    sh 'mvn clean'
                }
            }
        }

        stage('Compile Project') {
            steps {
                echo "Compiling project..."
                dir('app') {
                    sh 'mvn compile'
                }
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo "Running unit tests..."
                dir('app') {
                    sh 'mvn test'
                }
            }
        }

        stage('Package Application') {
            steps {
                echo "Packaging Spring Boot application..."
                dir('app') {
                    sh 'mvn package'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                dir('app') {
                    sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
                }
            }
        }

        stage('List Docker Images') {
            steps {
                echo "Available Docker Images"
                sh 'docker images'
            }
        }

        stage('Load Image into kind') {
    steps {
        sh 'kind load docker-image $IMAGE_NAME:$IMAGE_TAG --name portfolio-website'
    }
}   

stage('Deploy to Kubernetes') {
    steps {
        sh 'kubectl config use-context kind-portfolio-website'
        sh 'kubectl apply -f k8s/deployment.yaml'
        sh 'kubectl apply -f k8s/service.yaml'
    }
}

        stage('Verify Deployment') {
            steps {
                echo "Checking Deployment..."
                sh 'kubectl rollout status deployment/portfolio-website'
                sh 'kubectl get deployments'
                sh 'kubectl get pods'
                sh 'kubectl get svc'
            }
        }

    }

    post {

        always {
            echo "Pipeline Finished."
        }

        success {
            echo "======================================="
            echo "BUILD SUCCESSFUL"
            echo "Website Deployed Successfully"
            echo "======================================="
        }

        failure {
            echo "======================================="
            echo "BUILD FAILED"
            echo "Check Jenkins Console Output"
            echo "======================================="
        }

    }

}
