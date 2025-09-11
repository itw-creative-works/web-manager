class Firestore {
  constructor(manager) {
    this.manager = manager;
    this._db = null;
    this._initialized = false;
    this._initPromise = null;
  }

  async _ensureInitialized() {
    if (this._initialized) {
      return this._db;
    }

    if (!this._initPromise) {
      this._initPromise = this._initializeFirestore();
    }

    return this._initPromise;
  }

  async _initializeFirestore() {
    try {
      // Check if Firebase app is initialized
      if (!this.manager._firebaseApp) {
        throw new Error('Firebase app not initialized. Please initialize Firebase first.');
      }

      // Dynamically import Firestore
      const { getFirestore, doc: firestoreDoc, collection: firestoreCollection, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, limit, startAt, endAt } = await import('firebase/firestore');
      
      // Store references for later use
      this._firestoreMethods = {
        getFirestore,
        doc: firestoreDoc,
        collection: firestoreCollection,
        getDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        getDocs,
        query,
        where,
        orderBy,
        limit,
        startAt,
        endAt
      };

      // Initialize Firestore
      this._db = getFirestore(this.manager._firebaseApp);
      this._initialized = true;

      return this._db;
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      throw error;
    }
  }

  // Main doc() method - supports both 'path/to/doc' and ('collection', 'docId')
  doc(...args) {
    const self = this;
    let docPath;

    // Handle different argument patterns
    if (args.length === 1 && typeof args[0] === 'string') {
      // Single path string: doc('users/userId')
      docPath = args[0];
    } else if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
      // Collection and doc ID: doc('users', 'userId')
      docPath = `${args[0]}/${args[1]}`;
    } else {
      throw new Error('Invalid arguments for doc(). Use doc("path/to/doc") or doc("collection", "docId")');
    }

    return {
      async get() {
        await self._ensureInitialized();
        const docRef = self._firestoreMethods.doc(self._db, docPath);
        const docSnap = await self._firestoreMethods.getDoc(docRef);
        
        return {
          exists: () => docSnap.exists(),
          data: () => docSnap.data(),
          id: docSnap.id,
          ref: docRef
        };
      },

      async set(data, options = {}) {
        await self._ensureInitialized();
        const docRef = self._firestoreMethods.doc(self._db, docPath);
        return await self._firestoreMethods.setDoc(docRef, data, options);
      },

      async update(data) {
        await self._ensureInitialized();
        const docRef = self._firestoreMethods.doc(self._db, docPath);
        return await self._firestoreMethods.updateDoc(docRef, data);
      },

      async delete() {
        await self._ensureInitialized();
        const docRef = self._firestoreMethods.doc(self._db, docPath);
        return await self._firestoreMethods.deleteDoc(docRef);
      }
    };
  }

  // Collection method for queries
  collection(collectionPath) {
    const self = this;
    
    return {
      async get() {
        await self._ensureInitialized();
        const collRef = self._firestoreMethods.collection(self._db, collectionPath);
        const querySnapshot = await self._firestoreMethods.getDocs(collRef);
        
        return {
          docs: querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: () => doc.data(),
            exists: () => doc.exists(),
            ref: doc.ref
          })),
          size: querySnapshot.size,
          empty: querySnapshot.empty,
          forEach: (callback) => querySnapshot.forEach(callback)
        };
      },

      where(field, operator, value) {
        return self._buildQuery(collectionPath, [{ type: 'where', field, operator, value }]);
      },

      orderBy(field, direction = 'asc') {
        return self._buildQuery(collectionPath, [{ type: 'orderBy', field, direction }]);
      },

      limit(count) {
        return self._buildQuery(collectionPath, [{ type: 'limit', count }]);
      },

      doc(docId) {
        if (docId) {
          return self.doc(`${collectionPath}/${docId}`);
        }
        // Auto-generate ID if not provided
        return self.doc(`${collectionPath}/${self._generateId()}`);
      }
    };
  }

  // Build chainable query
  _buildQuery(collectionPath, constraints = []) {
    const self = this;

    const queryBuilder = {
      where(field, operator, value) {
        constraints.push({ type: 'where', field, operator, value });
        return queryBuilder;
      },

      orderBy(field, direction = 'asc') {
        constraints.push({ type: 'orderBy', field, direction });
        return queryBuilder;
      },

      limit(count) {
        constraints.push({ type: 'limit', count });
        return queryBuilder;
      },

      startAt(...values) {
        constraints.push({ type: 'startAt', values });
        return queryBuilder;
      },

      endAt(...values) {
        constraints.push({ type: 'endAt', values });
        return queryBuilder;
      },

      async get() {
        await self._ensureInitialized();
        const collRef = self._firestoreMethods.collection(self._db, collectionPath);
        
        // Build query constraints
        const queryConstraints = [];
        for (const constraint of constraints) {
          switch (constraint.type) {
            case 'where':
              queryConstraints.push(self._firestoreMethods.where(constraint.field, constraint.operator, constraint.value));
              break;
            case 'orderBy':
              queryConstraints.push(self._firestoreMethods.orderBy(constraint.field, constraint.direction));
              break;
            case 'limit':
              queryConstraints.push(self._firestoreMethods.limit(constraint.count));
              break;
            case 'startAt':
              queryConstraints.push(self._firestoreMethods.startAt(...constraint.values));
              break;
            case 'endAt':
              queryConstraints.push(self._firestoreMethods.endAt(...constraint.values));
              break;
          }
        }

        const q = self._firestoreMethods.query(collRef, ...queryConstraints);
        const querySnapshot = await self._firestoreMethods.getDocs(q);
        
        return {
          docs: querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: () => doc.data(),
            exists: () => doc.exists(),
            ref: doc.ref
          })),
          size: querySnapshot.size,
          empty: querySnapshot.empty,
          forEach: (callback) => querySnapshot.forEach(callback)
        };
      }
    };

    return queryBuilder;
  }

  // Helper to generate document IDs (similar to Firebase auto-generated IDs)
  _generateId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
}

export default Firestore;