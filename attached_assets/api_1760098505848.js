// src/services/api.js
const API_URL = 'http://localhost:5000/api';

// Função para fazer requisições
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    // Para relatórios, não tentar parsear JSON se for arquivo
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } else {
      // Se não for JSON, retornar a response diretamente para download
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      return response;
    }
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Servidor indisponível. Verifique se o backend está rodando.');
    }
    throw error;
  }
};

// Função auxiliar para limpar parâmetros
const cleanParams = (params) => {
  const cleaned = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

// Serviços da API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', { 
    method: 'POST', 
    body: credentials 
  }),
  getMe: () => apiRequest('/auth/me'),
};

// services/api.js - Adicione esta função no export const produtosAPI

export const produtosAPI = {
  getProdutos: (params = {}) => {
    const cleanedParams = cleanParams(params);
    const query = new URLSearchParams(cleanedParams).toString();
    return apiRequest(`/produtos${query ? `?${query}` : ''}`);
  },
  createProduto: (data) => apiRequest('/produtos', { 
    method: 'POST', 
    body: data 
  }),
  updateProduto: (id, data) => apiRequest(`/produtos/${id}`, { 
    method: 'PUT', 
    body: data 
  }),
  // ADICIONE ESTA FUNÇÃO:
  deleteProduto: (id) => apiRequest(`/produtos/${id}`, { 
    method: 'DELETE' 
  }),
};

export const categoriasAPI = {
  getCategorias: (params = {}) => {
    const cleanedParams = cleanParams(params);
    const query = new URLSearchParams(cleanedParams).toString();
    return apiRequest(`/categorias${query ? `?${query}` : ''}`);
  },
  createCategoria: (data) => apiRequest('/categorias', { 
    method: 'POST', 
    body: data 
  }),
};

export const locaisAPI = {
  getLocais: () => apiRequest('/locais'),
  createLocal: (data) => apiRequest('/locais', { 
    method: 'POST', 
    body: data 
  }),
};

export const movimentacoesAPI = {
  getMovimentacoes: (params = {}) => {
    const cleanedParams = cleanParams(params);
    const query = new URLSearchParams(cleanedParams).toString();
    return apiRequest(`/movimentacoes${query ? `?${query}` : ''}`);
  },
  createMovimentacao: (data) => apiRequest('/movimentacoes', { 
    method: 'POST', 
    body: data 
  }),
};

export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats'),
};

export const termosAPI = {
  getTermos: () => apiRequest('/termos'),
  createTermo: (data) => apiRequest('/termos', { 
    method: 'POST', 
    body: data 
  }),
};

// API para Inventário
export const inventarioAPI = {
  getInventarios: async () => {
    try {
      const response = await apiRequest('/inventario');
      return response;
    } catch (error) {
      console.error('Erro ao buscar inventários:', error);
      throw error;
    }
  },

  getInventario: async (id) => {
    try {
      const response = await apiRequest(`/inventario/${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar inventário:', error);
      throw error;
    }
  },

  createInventario: async (data) => {
    try {
      const response = await apiRequest('/inventario', { 
        method: 'POST', 
        body: data 
      });
      return response;
    } catch (error) {
      console.error('Erro ao criar inventário:', error);
      throw error;
    }
  },

  registrarContagem: async (data) => {
    try {
      const response = await apiRequest('/inventario/contagem', { 
        method: 'POST', 
        body: data 
      });
      return response;
    } catch (error) {
      console.error('Erro ao registrar contagem:', error);
      throw error;
    }
  },

  finalizarInventario: async (id) => {
    try {
      const response = await apiRequest(`/inventario/${id}/finalizar`, { 
        method: 'PUT' 
      });
      return response;
    } catch (error) {
      console.error('Erro ao finalizar inventário:', error);
      throw error;
    }
  },

  getContagens: async (inventarioId) => {
    try {
      const response = await apiRequest(`/inventario/${inventarioId}/contagens`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar contagens:', error);
      throw error;
    }
  },

  updateInventario: async (id, data) => {
    try {
      const response = await apiRequest(`/inventario/${id}`, { 
        method: 'PUT', 
        body: data 
      });
      return response;
    } catch (error) {
      console.error('Erro ao atualizar inventário:', error);
      throw error;
    }
  }
};

// API para Relatórios
export const relatoriosAPI = {
  getRelatorioProdutos: (formato = 'json') => apiRequest(`/relatorios/produtos?formato=${formato}`),
  getRelatorioMovimentacoes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/relatorios/movimentacoes${query ? `?${query}` : ''}`);
  },
  getRelatorioEstoqueBaixo: (formato = 'json') => apiRequest(`/relatorios/estoque-baixo?formato=${formato}`),
  getRelatorioValorEstoque: (formato = 'json') => apiRequest(`/relatorios/valor-estoque?formato=${formato}`),
  getRelatorioInventarios: (formato = 'json') => apiRequest(`/relatorios/inventarios?formato=${formato}`)
};

// API para Importação
export const importacaoAPI = {
  // Upload de PDF
  uploadArquivo: async (formData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/importacao/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Não definir Content-Type para FormData (o browser define automaticamente)
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  },

  // Vincular produto
  vincularProduto: (data) => apiRequest('/importacao/vincular-produto', { 
    method: 'POST', 
    body: data 
  }),

  // Buscar importações do usuário
  getImportacoes: () => apiRequest('/importacao/historico'),

  // Buscar importações por produto (se existir esta rota)
  getImportacoesPorProduto: (produtoId) => apiRequest(`/importacao/produto/${produtoId}`)
};

