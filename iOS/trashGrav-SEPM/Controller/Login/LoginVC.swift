//
//  LoginVC.swift
//  trashGrav-SEPM
//
//  Created by Thanh Phan on 6/15/20.
//  Copyright © 2020 Thanh Phan. All rights reserved.
//

import UIKit

class LoginVC: UIViewController {

    
    let phoneTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "Please Enter Your Phone Number"
        tf.backgroundColor = UIColor(white: 0, alpha: 0.03)
        tf.borderStyle = .roundedRect
        tf.font = UIFont.systemFont(ofSize: 14)
        tf.addTarget(self, action: #selector(formValidation), for: .editingChanged)
        return tf
    }()
    
    let loginButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Login", for: .normal)
        button.setTitleColor(.white, for: .normal)
        button.backgroundColor = UIColor(red: 149/255, green: 204/255, blue: 244/255, alpha: 1)
        button.addTarget(self, action: #selector(handleLogin), for: .touchUpInside)
        button.isEnabled = false
        button.layer.cornerRadius = 5
        return button
    }()
    
    let dontHaveAccountButton: UIButton = {
        let button = UIButton(type: .system)
        
        let attributedTitle = NSMutableAttributedString(string: "Don't have an account?  ", attributes: [NSAttributedString.Key.font: UIFont.systemFont(ofSize: 14), NSAttributedString.Key.foregroundColor: UIColor.lightGray])
        attributedTitle.append(NSAttributedString(string: "Sign Up", attributes: [NSAttributedString.Key.font: UIFont.boldSystemFont(ofSize: 14), NSAttributedString.Key.foregroundColor: UIColor(red: 17/255, green: 154/255, blue: 237/255, alpha: 1)]))
        button.addTarget(self, action: #selector(handleShowSignUp), for: .touchUpInside)
        button.setAttributedTitle(attributedTitle, for: .normal)
        
        return button
    }()

    
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Change background color
        view.backgroundColor = .white
        // Do any additional setup after loading the view.
        
        configureViewComponents()
        
        view.addSubview(dontHaveAccountButton)
        dontHaveAccountButton.anchor(top: nil, left: view.leftAnchor, bottom: view.bottomAnchor, right: view.rightAnchor, paddingTop: 0, paddingLeft: 0, paddingBottom: 0, paddingRight: 0, width: 0, height: 50)
    }
    
    @objc func handleShowSignUp() {
        let signUpVC = SignUpVC()
        navigationController?.pushViewController(signUpVC, animated: true)
    }
    
    @objc func handleLogin() {
        print("button is pushed")
    }
    
    @objc func formValidation() {
        
        // ensures that email and password text fields have text
        guard
            
            phoneTextField.hasText else {
                
                // handle case for above conditions not met
                loginButton.isEnabled = false
                loginButton.backgroundColor = UIColor(red: 149/255, green: 204/255, blue: 244/255, alpha: 1)
                return
        }
        
        // handle case for conditions were met
        loginButton.isEnabled = true
        loginButton.backgroundColor = UIColor(red: 17/255, green: 154/255, blue: 237/255, alpha: 1)
    }
    
    func configureViewComponents() {
           
           let stackView = UIStackView(arrangedSubviews: [phoneTextField, loginButton])
           
           stackView.axis = .vertical
           stackView.spacing = 10
           stackView.distribution = .fillEqually
           
           view.addSubview(stackView)
        stackView.anchor(top: view.topAnchor, left: view.leftAnchor, bottom: nil, right: view.rightAnchor, paddingTop: 140, paddingLeft: 40, paddingBottom: 0, paddingRight: 40, width: 0, height: 140)
       }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
