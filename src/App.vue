<script setup>
import { computed, onMounted, ref } from "vue";

import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";

// GraphQL query
const ALLSTARSHIPS_QUERY = gql`
  query AllStarships($first: Int, $after: String) {
    allStarships(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
          starshipClass
        }
      }
    }
  }
`;

// create ref for observer
const observer = ref(null);

// create ref for target element for observer to observe
const target = ref(null);

// destructure
const {
  // result of the query
  result,

  // loading state of the query
  loading,

  // query errors, if any
  error,

  // method to fetch more
  fetchMore,

  // access to query variables
  variables,
} = useQuery(ALLSTARSHIPS_QUERY, { first: 5 });

// computed value to know if there are more pages after the last result
const hasNextPage = computed(() => result.value.allStarships.pageInfo.hasNextPage);

// console.log({ result, loading, error, variables, hasNextPage });

// function to load more content and update query result
const loadMore = () => {
  // fetchMore function from `useQuery` to fetch more content with `updateQuery`
  fetchMore({
    // update `after` variable with `endCursor` from previous result
    variables: {
      after: result.value?.allStarships.pageInfo.endCursor,
    },

    // pass previous query result and the new results to `updateQuery`
    updateQuery: (previousQueryResult, { fetchMoreResult }) => {
      // define edges and pageInfo from new results
      const newEdges = fetchMoreResult.allStarships.edges;
      const pageInfo = fetchMoreResult.allStarships.pageInfo;

      // if newEdges actually have items,
      return newEdges.length
        ? // return a reconstruction of the query result with updated values
          {
            // spread the value of the previous result
            ...previousQueryResult,
            allStarships: {
              // spread the value of the previous `allStarhips` data into this object
              ...previousQueryResult.allStarships,

              // concatenate edges
              edges: [...previousQueryResult.allStarships.edges, ...newEdges],

              // Override with new pageInfo
              pageInfo,
            },
          }
        : // else, return the previous result
          previousQueryResult;
    },
  });
};

onMounted(() => {
  // // listen to the scroll event in the window object (the page)
  // window.addEventListener(
  //   "scroll",
  //   () => {
  //     // define
  //     let {
  //       // the amount useer has scrolled
  //       scrollTop,

  //       // the height of the page
  //       scrollHeight,

  //       // the height of viewport
  //       clientHeight
  //     } = document.documentElement;

  //     // if user has scrolled to the bottom of the page
  //     if (scrollTop + clientHeight >= scrollHeight && hasNextPage.value) {

  //       // exccute the loadMore function to fetch more items
  //       loadMore();
  //     }
  //   },
  //   {
  //     // indicate that the listener will not cancel the scroll
  //     passive: true,
  //   }
  // );

  // options for observer
  const options = {
    threshold: 1.0,
  };

  // define obseerver
  observer.value = new IntersectionObserver(([entry]) => {

    // if the target is visible
    if (entry && entry.isIntersecting) {

      // load more content
      loadMore();
    }
  }, options);

  // define the target to observe
  observer.value.observe(target.value);
});
</script>

<template>
  <main>
    <ul class="starship-list">
      <p v-if="error">oops</p>

      <!-- "infinite" list -->
      <li v-else v-for="starship in result?.allStarships.edges" :key="starship.node.id" class="starship-item">
        <p>{{ starship.node.name }}</p>
      </li>
    </ul>

    <!-- target button, load more manually when clicked -->
    <button ref="target" @click="loadMore" class="cta">
      <span v-if="loading">Loading...</span>
      <span v-else-if="!hasNextPage">That's a wrap!</span>
      <span v-else>More</span>
    </button>
  </main>
</template>

<style scoped>
button {
  cursor: pointer;
}

main {
  width: 100%;
  max-width: 30rem;
  margin: auto;
  padding: 2rem;
}
.starship-list {
  list-style: none;
  padding: 4rem 0 4rem 0;
}

.starship-item {
  font-size: xx-large;
  padding: 1rem 0;
}

.cta {
  padding: 0.5rem 1rem;
  background: var(--vt-c-white-soft);
  color: var(--color-background-soft);
  border: none;
  border-radius: 0.5rem;
}
</style>
