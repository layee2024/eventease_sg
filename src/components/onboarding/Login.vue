<template>
	<div>
		<!-- Logo -->
		<div id="container" class="container">
			<div class="form">
				<div class="image-side">
					<h2 class="poppins-bold">Welcome Back!</h2>
					<p>Enter your details to access your account</p>
					<hr class="solid">
					<span>
						Don't have an account?
						<router-link to="/register">Register here</router-link>
					</span>
				</div>
				<div class="form-side">
					<h2 class="poppins-bold">Sign In</h2>
					<form>
						<input type="email" placeholder="Email" required>
						<input type="password" placeholder="Password" required>
						<button type="submit">Login</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				email: '',
				password: '',
			}
		},
		methods: {
			loginUser() {
				// TODO: Authenticate this logging in
				console.log('Logging in with', this.email, this.password)
				alert('Login successful (stub). Redirecting...')
				this.$router.push('/') // redirect to homepage after login
			},
		},
	}
</script>

<style scoped>
	.solid {
		margin: 0.5rem auto;
		width: 90%;
		border-top: 3px solid white;
	}

	#container {
		min-height: 80vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.form {
		display: flex;
		justify-content: center;
		background: white;
		border-radius: 20px;
		overflow: hidden;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	}

	.form .image-side {
		flex: 1;
		background: linear-gradient(45deg, #FF6B6B, #FFE66D);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		text-align: center;
	}

	.form .form-side {
		flex: 1;
		padding: 3rem;
	}

	.form input {
		width: 100%;
		padding: 1rem;
		margin: 0.5rem 0;
		border: none;
		background-color: transparent;
		color: black;
		border-bottom: 2px solid #eee;
		outline: none;
		transition: border-color 0.3s;
	}

	.form input:focus {
		border-bottom-color: #FF6B6B;
	}

	.form button {
		width: 100%;
		padding: 1rem;
		margin-top: 1.5rem;
		background: #FF6B6B;
		color: white;
		border: none;
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		transition: transform 0.3s;
	}

	.form button:hover {
		transform: translateY(-2px);
	}
</style>
