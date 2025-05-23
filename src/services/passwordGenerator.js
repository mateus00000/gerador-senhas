/**
 * Serviço para geração de senhas seguras
 */

/**
 * Gera uma senha aleatória com os critérios especificados
 * @param {number} length - Comprimento da senha
 * @param {boolean} useUpperCase - Incluir letras maiúsculas
 * @param {boolean} useLowerCase - Incluir letras minúsculas
 * @param {boolean} useNumbers - Incluir números
 * @param {boolean} useSpecialChars - Incluir caracteres especiais
 * @returns {string} - A senha gerada
 */
export const generatePassword = (
  length = 12,
  useUpperCase = true,
  useLowerCase = true,
  useNumbers = true,
  useSpecialChars = true
) => {
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  // Criar um pool de caracteres baseado nos critérios selecionados
  let charPool = '';
  if (useUpperCase) charPool += upperCaseChars;
  if (useLowerCase) charPool += lowerCaseChars;
  if (useNumbers) charPool += numberChars;
  if (useSpecialChars) charPool += specialChars;
  
  // Se nenhum conjunto de caracteres for selecionado, usar letras minúsculas e números
  if (!charPool) {
    charPool = lowerCaseChars + numberChars;
  }
  
  // Gerar a senha aleatoriamente
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    password += charPool[randomIndex];
  }
  
  return password;
};

/**
 * Verifica a força da senha com base em alguns critérios
 * @param {string} password - A senha a ser verificada
 * @returns {string} - 'fraca', 'média' ou 'forte'
 */
export const checkPasswordStrength = (password) => {
  let strength = 0;
  
  // Verifica o comprimento
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Verifica caracteres minúsculos
  if (/[a-z]/.test(password)) strength += 1;
  
  // Verifica caracteres maiúsculos
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Verifica números
  if (/[0-9]/.test(password)) strength += 1;
  
  // Verifica caracteres especiais
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  // Determina o nível de força
  if (strength < 3) return 'fraca';
  if (strength < 5) return 'média';
  return 'forte';
};

/**
 * Avalia a força da senha
 * @param {string} password - Senha para avaliar
 * @returns {number} Pontuação da força (0-100)
 */
export const evaluatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Comprimento (até 40 pontos)
  score += Math.min(40, password.length * 4);
  
  // Variedade de caracteres (até 60 pontos)
  if (/[A-Z]/.test(password)) score += 15; // Maiúsculas
  if (/[a-z]/.test(password)) score += 10; // Minúsculas
  if (/[0-9]/.test(password)) score += 15; // Números
  if (/[^A-Za-z0-9]/.test(password)) score += 20; // Símbolos
  
  return Math.min(100, score);
}; 